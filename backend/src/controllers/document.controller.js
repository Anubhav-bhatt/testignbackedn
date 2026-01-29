export const uploadDocument = async (req, res) => {
  console.log("🔥 UPLOAD HIT");
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({
      error: "File not received by backend",
    });
  }

  return res.json({
    success: true,
    message: "File received",
  });
};
