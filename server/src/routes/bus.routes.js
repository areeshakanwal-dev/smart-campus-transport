// const router = require('express').Router();
// const ctrl = require('../controllers/bus.controller');
// const { authenticate, authorize } = require('../middleware/auth.middleware');

// // All routes below require the user to be logged in
// router.use(authenticate); 

// // Anyone logged in can view the list of buses
// router.get('/', ctrl.listBuses);

// // Only admins can create buses or assign drivers
// router.post('/', authorize('admin'), ctrl.createBus);
// router.patch('/:busId/assign-driver', authorize('admin'), ctrl.assignDriver);

// module.exports = router;

// router.get('/live', authorize('admin'), ctrl.getLiveBuses);
// router.get('/:busId/last-location', ctrl.getBusLastLocation);

// router.get('/stops', ctrl.listStops);
// router.post('/stops', authorize('admin'), ctrl.createStop);

// router.get('/:busId/eta/:stopId', ctrl.getETA);
// router.get('/analytics', authorize('admin'), ctrl.getAnalytics);

const router = require('express').Router();
const ctrl = require('../controllers/bus.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Bus Management
router.get('/', ctrl.listBuses);
router.post('/', authorize('admin'), ctrl.createBus);
router.put('/:id', authorize('admin'), ctrl.updateBus);
router.delete('/:id', authorize('admin'), ctrl.deleteBus);
router.patch('/:busId/assign-driver', authorize('admin'), ctrl.assignDriver);

// Live Tracking
router.get('/live', ctrl.getLiveBuses); 
router.get('/:busId/live', ctrl.getBusLastLocation);

// Stops
router.get('/stops/list', ctrl.listStops);
router.post('/stops', authorize('admin'), ctrl.createStop);

// ETA & Analytics
router.get('/eta/:busId/:stopId', ctrl.getETA);
router.get('/analytics', authorize('admin'), ctrl.getAnalytics);

module.exports = router;