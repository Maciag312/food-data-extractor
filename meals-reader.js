class Order {
    constructor(qty, mealName, total) {
        this.qty = qty
        this.mealName = mealName
        this.total = total
    }
}

class Meal {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
}

function getLineByTag(text, tag) {
    var result = text.split('\n').filter(t => t.includes(tag))[0]
    result = result.replace(tag, '')
    return result
}
function extractRestaurant(text) {
    return getLineByTag(text, '< ')
}

function extractDiscount(text) {
    return extractPrice(getLineByTag(text, 'Menu discount '))
}

function extractDeliveryFee(text) {
    return extractPrice(getLineByTag(text, 'Delivery fee '))
}

function extractTotal(text) {
    return extractPrice(getLineByTag(text, 'Total '))
}

function extractPrice(priceWithCurrency) {
    return parseFloat(priceWithCurrency.replace(' zt', '').replace(',', '.'))
}

function extractOrders(text) {
    newOrder = false
    orders = text
        .split('\n')
        .reduce((acc, val) => {
        if (val.includes(' x ')) {
            qty = val.split(' ')[0]
            priceInZl = val.match('-?[0-9]+,[0-9]+ zt')[0]
            mealName = val.split(' x ')[1].replace(priceInZl, '')
            acc.push(new Order(qty, mealName, extractPrice(priceInZl)))
            newOrder = true
        } 
        else if (val == '') {
            newOrder = false
        }
        else if(newOrder === true) {
            i = acc.length - 1
            acc[i].mealName = concatAndToLowerCase(acc[i].mealName, val)
        }
        return acc
    }, [])
    return orders
}



function concatAndToLowerCase(mealName1, mealName2) {
    mealName1 += (" " + mealName2)
    mealName1 = mealName.replace(/ +(?= )/g,'')
    return mealName1.toLowerCase()
}

function getMeals(text, total, discount, deliveryFee) {
    orders = extractOrders(text)
    total = extractTotal(text)
    discount = extractDiscount(text)
    deliveryFee = extractDeliveryFee(text)
    return orders.map(o =>  new Meal(o.mealName, calculateOrderPrice(total, o.qty, deliveryFee, discount, orders.length)))
}

function calculateOrderPrice(orderTotal, orderQty, deliveryFee, discount, ordersSize) {
    orderPrice = orderTotal / orderQty
    orderPrice *= calculateDiscountMultiplier(total, deliveryFee, discount)  
    orderPrice += deliveryFee / ordersSize
    orderPrice = parseFloat(orderPrice).toFixed(2)
    return orderPrice
}

function calculateDiscountMultiplier(total, deliveryFee, discount) {
    return (total - deliveryFee) / (total - discount - deliveryFee) 
}

