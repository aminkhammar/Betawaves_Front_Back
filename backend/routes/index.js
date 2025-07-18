
const express = require('express');
const router = express.Router();

// Import all route modules
const servicesRoutes = require('./services');
const consultingsRoutes = require('./consulting');
const productsRoutes = require('./products');
const fundsRoutes = require('./funds');
const caseStudiesRoutes = require('./case-studies');
const blogPostsRoutes = require('./blog-posts');
const eventsRoutes = require('./events');
const contactMessagesRoutes = require('./contact-messages');
const resourcesRoutes = require('./resources');
const teamMembersRoutes = require('./team-members');
const programApplicationsRoutes = require('./program-applications');
const uploadsRoutes = require('./uploads');

// Mount all routes
router.use('/services', servicesRoutes);
router.use('/consulting', consultingsRoutes);
router.use('/products', productsRoutes);
router.use('/funds', fundsRoutes);
router.use('/case-studies', caseStudiesRoutes);
router.use('/blog-posts', blogPostsRoutes);
router.use('/events', eventsRoutes);
router.use('/contact-messages', contactMessagesRoutes);
router.use('/resources', resourcesRoutes);
router.use('/team-members', teamMembersRoutes);
router.use('/program-applications', programApplicationsRoutes);
router.use('/uploads', uploadsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

module.exports = router;
