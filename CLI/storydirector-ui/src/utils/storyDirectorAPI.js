// /utils/storyDirectorAPI.js

export function getActiveProjectData() {
  const raw = localStorage.getItem("storydirector_active_project_data");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentOutline() {
  const raw = localStorage.getItem("storydirector_outline_draft");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getPitchResults() {
  const raw = localStorage.getItem("pitch_results");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getBrainstormSessions() {
  const raw = localStorage.getItem("brainstorm_sessions");
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getUserProfile() {
  const raw = localStorage.getItem("storydirector_user_profile");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoryDirectorProjects() {
  const raw = localStorage.getItem("storydirector_projects");
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getFullProjectContext() {
  try {
    return {
      project: getActiveProjectData(),
      outline: getCurrentOutline(),
      pitch: getPitchResults(),
      brainstorm: getBrainstormSessions(),
      profile: getUserProfile(),
      allprojects: getStoryDirectorProjects()
    };
  } catch (err) {
    console.error("Error in getFullProjectContext:", err);
    return null;
  }
}

export default {
  getActiveProjectData,
  getCurrentOutline,
  getPitchResults,
  getBrainstormSessions,
  getStoryDirectorProjects,
  getUserProfile,
  getFullProjectContext
};