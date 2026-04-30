export const adminController = (req, res) => {
  res.json({
    message: "Welcome Admin",
    user: req.user
  });
};