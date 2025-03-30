import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const crop = formData.get("crop") as string;

    if (!file || !crop) {
      return NextResponse.json(
        { success: false, error: "File and crop are required" },
        { status: 400 }
      );
    }

    const pythonFormData = new FormData();
    pythonFormData.append("image", file);
    pythonFormData.append("model", crop);

    // const response = await fetch("http://localhost:5000/classify", {
    //   method: "POST",
    //   body: pythonFormData,
    // });

    // if (!response.ok) {
    //   throw new Error(`Python backend returned status: ${response.status}`);
    // }

    // const data = await response.json();
    const data = {
      category: "Black Rot",
      confidence: 1.0,
    };

    return NextResponse.json({
      success: true,
      category: data.category,
      confidence: data.confidence,
    });
  } catch (error: any) {
    console.error("Error detecting disease:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to detect disease" },
      { status: 500 }
    );
  }
}
