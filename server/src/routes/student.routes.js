const router = require('express').Router();
const ctrl = require('../controllers/student.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/me', ctrl.getMyStudent);

router.post('/board', ctrl.logBoarding);
router.get('/bus/:busId', ctrl.getBusStudents);

module.exports = router;