const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// Validate that the dish exists
const dishExists = (req, res, next) => {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id == dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    else next({ status: 404, message: `Dish id not found: ${dishId}` });
}

// Validate that any required props exist.
const validProp = (prop) => {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[prop]) return next();
        else next({ status: 400, message: `Dish must include a ${prop}` });
    }
}

// Validate that price exists
const validatePrice = (req, res, next) => {
    const { data: { price } = {} } = req.body;
    let failedMsg = "";
    if (!price) failedMsg = "Dish must include a price.";
    else if (price <= 0) failedMsg = "Dish price must be a number.";
    else if (!Number.isInteger(price)) failedMsg = "Dish price must be greater than 0.";
    if (failedMsg) next({ status: 400, message: failedMsg });
    else next();
}

const list = (req, res, next) => {
    const { dishId } = req.body;
    res.json({ data: dishes.filter(dishId ? dish => dish.id == dishId : () => true) })
}

const read = (req, res, next) => {
    res.json({ data: res.locals.dish });
}
const create = (req, res, next) => {
    const { data: { name, description, image_url, price } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        image_url,
        price
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

const update = (req, res, next) => {
    const { dishId } = req.params;
    const { data: { id, name, description, image_url, price } = {} } = req.body;
    if (!id || dishId === id) {
        res.locals.dish = {
            id: dishId,
            name: name,
            description: description,
            image_url: image_url,
            price: price
        }
        res.json({ data: res.locals.dish });
    }
    else next({ status: 400, message: `dishId ${dishId} does not match data.id ${id}` });
}

module.exports = {
    list,
    read: [dishExists, read],
    create: [
        validProp("name"),
        validProp("description"),
        validProp("image_url"),
        validatePrice,
        create
    ],
    update: [
        dishExists,
        validProp("name"),
        validProp("description"),
        validProp("image_url"),
        validatePrice,
        update
    ],
}