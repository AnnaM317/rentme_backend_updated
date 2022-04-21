const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getOrders, addOrder, updateOrder, removeOrder } = require('./order.controller')
const router = express.Router()

router.get('/', log, getOrders)
router.post('/', requireAuth, addOrder)
router.put('/:id', requireAuth, updateOrder)
router.delete('/:id', requireAuth, removeOrder)


module.exports = router