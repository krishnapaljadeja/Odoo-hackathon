export const isEmployee = (req, res, next) => {
  if (req.user.role != "COMPANY_EMPLOYEE") {
    return res
      .status(403)
      .json({ message: "You are not authorized to access this route" });
  }
  next();
};

export const isStudent = (req, res, next) => {
  if (req.user.role != "USER") {
    return res
      .status(403)
      .json({ message: "You are not authorized to access this route" });
  }
  next();
};
