import Project from "../models/Project.model.js";

export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      budget,
      deadline,
      visibility,
    } = req.body;

   
    if (
      !title ||
      !description ||
      !budget ||
      !deadline
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can create projects.",
      });
    }

    const project = await Project.create({
      client: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      requiredSkills,
      budget,
      deadline,
      visibility,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project,
    });

  } catch (error) {
    console.error("Create Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === "client") {
      query = { client: userId };
    } else if (userRole === "freelancer") {
      query = { visibility: { $ne: "Private" } };
    } else if (userRole === "admin") {
      query = {};
    }

    const projects = await Project.find(query)
      .populate("client", "fullName email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });

  } catch (error) {
    console.error("Get Projects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = { _id: projectId };
    if (userRole === "client") {
      query.client = userId;
    }

    const project = await Project.findOne(query).populate("client", "fullName email avatar");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });

  } catch (error) {
    console.error("Get Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findOne({
      _id: projectId,
      client: userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const {
      title,
      description,
      category,
      requiredSkills,
      budget,
      deadline,
      visibility,
      status,
    } = req.body;

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (category) project.category = category;
    if (requiredSkills) project.requiredSkills = requiredSkills;
    if (budget) project.budget = budget;
    if (deadline) project.deadline = deadline;
    if (visibility) project.visibility = visibility;
    if (status) project.status = status;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });

  } catch (error) {
    console.error("Update Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findOneAndDelete({
      _id: projectId,
      client: userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const deleteAllProjects = async (req, res) => {
  try {
    // Only Admin can delete all projects
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const result = await Project.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "All projects deleted successfully.",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    console.error("Delete All Projects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


