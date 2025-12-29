import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'image/jpeg',
  'image/png',
  'image/jpg',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;
    const fileType = formData.get('fileType') as string; // 'abstract' | 'full_paper' | 'supplementary'
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    // 3. Validate file
    const fileSize = file.size;
    const fileName = file.name;
    const fileMimeType = file.type;
    const fileExtension = path.extname(fileName).toLowerCase();

    // Check file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(fileMimeType) || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG' },
        { status: 400 }
      );
    }

    // 4. Generate unique filename
    const fileId = uuidv4();
    const uniqueFileName = `${fileId}${fileExtension}`;

    // 5. Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'applications', applicationId);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 6. Save file locally
    const filePath = path.join(uploadDir, uniqueFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 7. Generate public URL
    const fileUrl = `/uploads/applications/${applicationId}/${uniqueFileName}`;

    // 8. Send to n8n webhook (optional - for backup/processing)
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';
      const webhookResponse = await fetch(`${webhookUrl}/webhook-test/application-file-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WEBHOOK_API_KEY && {
            'X-Webhook-Key': process.env.WEBHOOK_API_KEY,
          }),
        },
        body: JSON.stringify({
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            source: 'application-file-upload',
            environment: process.env.NODE_ENV || 'development',
          },
          requestedBy: {
            userId: user.id,
            userEmail: user.email || '',
            userName: user.name || '',
            userRole: user.role || 'KATILIMCI',
          },
          file: {
            fileId,
            fileName: fileName,
            originalFileName: fileName,
            uniqueFileName,
            fileSize,
            fileType: fileExtension.replace('.', ''),
            fileMimeType,
            fileUrl,
            localPath: filePath,
            applicationId,
            uploadType: fileType || 'general',
            description: description || '',
          },
        }),
      });

      if (!webhookResponse.ok) {
        console.warn('Webhook notification failed (continuing):', await webhookResponse.text());
      }
    } catch (webhookError) {
      console.error('Webhook error (continuing):', webhookError);
      // Don't fail the upload if webhook fails
    }

    // 9. Return success
    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        name: fileName,
        uniqueName: uniqueFileName,
        size: fileSize,
        type: fileExtension.replace('.', ''),
        mimeType: fileMimeType,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for file removal
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('fileUrl');

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL required' }, { status: 400 });
    }

    // Delete file (implement as needed)
    // For now, just return success
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { error: error.message || 'File deletion failed' },
      { status: 500 }
    );
  }
}
