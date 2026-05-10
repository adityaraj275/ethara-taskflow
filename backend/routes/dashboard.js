const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

router.get('/', auth, async (req, res) => {
  try {
    const projectFilter = req.user.role === 'admin'
      ? {}
      : { $or: [{ owner: req.user.id }, { members: req.user.id }] };
    const taskFilter = req.user.role === 'admin' ? {} : { assignedTo: req.user.id };
    const [totalProjects, totalTasks, todo, inProgress, done] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'todo' }),
      Task.countDocuments({ ...taskFilter, status: 'in-progress' }),
      Task.countDocuments({ ...taskFilter, status: 'done' }),
    ]);
    res.json({ totalProjects, totalTasks, todo, inProgress, done });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;