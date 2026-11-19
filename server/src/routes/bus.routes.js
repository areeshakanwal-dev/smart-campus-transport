const router = require('express').Router();
const ctrl = require('../controllers/bus.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes below require the user to be logged in
router.use(authenticate); 

// Anyone logged in can view the list of buses
router.get('/', ctrl.listBuses);

// Only admins can create buses or assign drivers
router.post('/', authorize('admin'), ctrl.createBus);
router.patch('/:busId/assign-driver', authorize('admin'), ctrl.assignDriver);

module.exports = router;

router.get('/live', authorize('admin'), ctrl.getLiveBuses);
router.get('/:busId/last-location', ctrl.getBusLastLocation);

router.get('/stops', ctrl.listStops);
router.post('/stops', authorize('admin'), ctrl.createStop);

router.get('/:busId/eta/:stopId', ctrl.getETA);
router.get('/analytics', authorize('admin'), ctrl.getAnalytics);