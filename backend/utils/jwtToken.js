// CREATE TOKEN AND SAVE IT IN COOKIES

const sendToken = (user, statusCode, resp) => {
  const token = user.getJwtToken(); 

  // OPTIONS FOR COOKIES
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 
    httpOnly: true, 
    sameSite: "none",
    secure: true,
  };

  resp
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user,
      token,
    });
};

module.exports = sendToken;
