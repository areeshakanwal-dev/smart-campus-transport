const router = require('express').Router();
const ctrl = require('../controllers/student.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/me', ctrl.getMyStudent);

module.exports = router;