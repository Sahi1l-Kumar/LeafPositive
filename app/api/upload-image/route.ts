// import { Storage } from "@google-cloud/storage";
// import { NextApiRequest, NextApiResponse } from "next";
// import formidable from "formidable";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const storage = new Storage({
//   projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
//   credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
// });

// const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME || "");

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   const form = new formidable.IncomingForm();
//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       return res.status(500).json({ error: "Error parsing form data" });
//     }

//     const file = files.image as formidable.File;
//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     try {
//       const blob = bucket.file(
//         `uploads/${Date.now()}-${file.originalFilename}`
//       );
//       const blobStream = blob.createWriteStream();

//       blobStream.on("error", (error) => {
//         res
//           .status(500)
//           .json({ error: "Error uploading to Google Cloud Storage" });
//       });

//       blobStream.on("finish", () => {
//         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//         res.status(200).json({ url: publicUrl });
//       });

//       blobStream.end(await fs.promises.readFile(file.filepath));
//     } catch (error) {
//       res.status(500).json({ error: "Error uploading image" });
//     }
//   });
// }
