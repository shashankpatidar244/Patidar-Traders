import { NextResponse } from "next/server"
import cloudinary from "../../lib/cloudinary"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    // No file
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      )
    }

    // Validate file type (IMPORTANT)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only images are allowed" },
        { status: 400 }
      )
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File too large (max 5MB)" },
        { status: 400 }
      )
    }

    // Convert file → buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadRes: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "products",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Error:", error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      )

      stream.end(buffer)
    })

    // Success response
    return NextResponse.json({
      success: true,
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    })

  } catch (error: any) {
    console.error("UPLOAD ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Upload failed",
      },
      { status: 500 }
    )
  }
}