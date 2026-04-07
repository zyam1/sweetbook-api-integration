const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const projectService = require('../services/projectService');

const router = Router();

// 내 프로젝트 목록 조회
router.get('/', authRequired, async (req, res, next) => {
  try {
    const data = await projectService.listMyProjects({
      userId: req.user.id,
      status: req.query.status,
      limit: Number(req.query.limit) || undefined,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 마지막 편집 프로젝트 조회
router.get('/last-edited', authRequired, async (req, res, next) => {
  try {
    const data = await projectService.getLastEditedProject(req.user.id);
    res.json(data ?? null);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
