import Achievement from "../models/Achievement.model.js";


export const getMyAchievements = async (req, res) => {
  try {
    const userId = req.user.id;

    const achievements = await Achievement.find({ user: userId }).sort({
      earnedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: achievements.length,
      achievements,
    });
  } catch (error) {
    console.error("Get My Achievements Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const achievements = await Achievement.find({ user: userId }).sort({
      earnedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: achievements.length,
      achievements,
    });
  } catch (error) {
    console.error("Get User Achievements Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};