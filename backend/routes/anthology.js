const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authRequired } = require('../middleware/auth');
const { contributorAuth } = require('../middleware/contributorAuth');
const anthologyService = require('../services/anthologyService');

const router = Router();

// multer 설정 - contributor 제출물 업로드용
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const anthologyId = req.contributor.anthologyId;
    const contributorId = req.contributor.contributorId;
    const dest = path.join(
      __dirname,
      '..',
      'uploads',
      'anthology',
      String(anthologyId),
      String(contributorId)
    );
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
});

// multer 설정 - owner 대리 업로드용 (req.params.id, req.params.cid)
const ownerUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const dest = path.join(
        __dirname,
        '..',
        'uploads',
        'anthology',
        String(req.params.id),
        String(req.params.cid)
      );
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename(req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
});

// 내 앤솔로지 목록 조회 (role=owner | contributor)
router.get('/', authRequired, async (req, res, next) => {
  try {
    const { role } = req.query;
    if (role === 'owner') {
      const data = await anthologyService.listOwned(req.user.id);
      return res.json(data);
    }
    if (role === 'contributor') {
      const data = await anthologyService.listJoined(req.user.id);
      return res.json(data);
    }
    return res.status(400).json({ error: 'INVALID_ROLE' });
  } catch (err) {
    next(err);
  }
});

// 합본 생성
router.post('/', authRequired, async (req, res, next) => {
  try {
    const data = await anthologyService.create(req.user.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// contributor 인증 (인증 없음)
router.post('/contrib/auth', async (req, res, next) => {
  try {
    const { token, handle } = req.body || {};
    const data = await anthologyService.authContributor(token, handle);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// contributor 제출물 추가 (contributorAuth + multer)
router.post(
  '/contrib/submissions',
  contributorAuth,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'FILE_REQUIRED' });
      }
      const data = await anthologyService.addSubmission(req.contributor.contributorId, {
        fileName: req.file.filename,
        storedPath: req.file.path,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        dpi: req.body?.dpi ? Number(req.body.dpi) : null,
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

// contributor 본인 제출물 목록
router.get('/contrib/me/submissions', contributorAuth, async (req, res, next) => {
  try {
    const data = await anthologyService.listSubmissions(req.contributor.contributorId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// contributor 본인 대시보드
router.get('/contrib/me/dashboard', contributorAuth, async (req, res, next) => {
  try {
    const data = await anthologyService.getContributorDashboard(req.contributor.contributorId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 합본 상세 조회 (소유자만)
router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = await anthologyService.getById(id);
    if (!data) {
      return res.status(404).json({ error: 'ANTHOLOGY_NOT_FOUND' });
    }
    if (data.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 표지 정보 업데이트
router.patch('/:id/cover', authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = await anthologyService.updateCover(id, req.user.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// contributor 추가
router.post('/:id/contributors', authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = await anthologyService.addContributor(id, req.user.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// contributor 순서 변경
router.patch('/:id/contributors/order', authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { orderedIds } = req.body || {};
    const data = await anthologyService.reorderContributors(id, req.user.id, orderedIds);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// owner 대리 제출물 업로드
router.post(
  '/:id/contributors/:cid/submissions',
  authRequired,
  ownerUpload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'FILE_REQUIRED' });
      }
      const data = await anthologyService.addOwnerSubmission(
        Number(req.params.id),
        req.user.id,
        Number(req.params.cid),
        {
          fileName: req.file.filename,
          storedPath: req.file.path,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          dpi: req.body?.dpi ? Number(req.body.dpi) : null,
        }
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

// contributor 목록
router.get('/:id/contributors', authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = await anthologyService.listContributors(id, req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 합본 최종화
router.post('/:id/finalize', authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = await anthologyService.finalize(id, req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 합본 주문 생성
router.post('/:id/order', authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { quantity, shipping } = req.body || {};
    const data = await anthologyService.createOrder(id, req.user.id, { quantity, shipping });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
