const express = require('express');
const router = express.Router();
const apiTestController = require('../controllers/apiTestController');

// API test routes
router.get('/test/github', apiTestController.testGitHubApi);
router.get('/test/openai', apiTestController.testOpenAiApi);
router.get('/config', apiTestController.getApiConfig);

module.exports = router;
