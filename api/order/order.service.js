const dbService = require('../../services/db.service');
const ObjectId = require('mongodb').ObjectId;
const asyncLocalStorage = require('../../services/als.service');
const socketService = require('../../services/socket.service');

module.exports = {
    remove,
    query,
    add,
    update,
    getById,
};

async function query(userId, userType) {
    try {
        const criteria = _buildCriteria(userId, userType);
        const collection = await dbService.getCollection('order');
        var orders = await collection.find(criteria).toArray();
        return orders;
    } catch (err) {
        console.log(err);
        logger.error('cannot find orders', err);
        throw err;
    }
}

function _buildCriteria(userId, userType) {
    let criteria = {};
    if (userType === 'host') criteria['hostId'] = ObjectId(userId);
    else criteria['buyer._id'] = ObjectId(userId);
    return criteria;
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order');
        const order = collection.findOne({ _id: ObjectId(orderId) });
        return order;
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err);
        throw err;
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('order');
        await collection.deleteOne({ _id: ObjectId(orderId) });
        return orderId;
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err);
        throw err;
    }
}

async function add(order) {
    try {
     
        const buyer = {
            _id: ObjectId(order.buyer.id),
            fullname: order.buyer.fullname,
            imgUrl: order.buyer.imgUrl,
        };
        order.buyer = buyer;
        order.hostId = ObjectId(order.hostId);
        const stay = {
            _id: ObjectId(order.stay._id),
            name: order.stay.name,
            price: order.stay.price,
            imgUrls: order.stay.imgUrls,
        };
        order.stay = stay;
        const collection = await dbService.getCollection('order');
        const orderId = await collection.insertOne(order);
        order._id = orderId.insertedId;
        socketService.emitToUser({
            type: 'order-added',
            data: order,
            userId: order.hostId,
        });
        return order;
    } catch (err) {
        logger.error('cannot insert order', err);
        throw err;
    }
}
async function update(order) {
    try {
        const orderToSave = {
            _id: ObjectId(order._id), // needed for the returnd obj
            status: order.status,
        };
        const collection = await dbService.getCollection('order');
        await collection.updateOne({ _id: orderToSave._id }, { $set: orderToSave });
        return order;
    } catch (err) {
        logger.error(`cannot update order ${order._id}`, err);
        throw err;
    }
}
