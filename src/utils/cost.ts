import { Coordinate, getDistanceBetweenTwoPoints } from "./geo";

let costBase = process.env.costBase;
let costPerKm = process.env.costPerKm;
let baseDistance = process.env.baseDistance;
let costDriverConvenience = process.env.costDriverConvenience;

export function getCost(pickupLocation: Coordinate, dropLocation: Coordinate) {
    let distance = getDistanceBetweenTwoPoints(pickupLocation, dropLocation);
    let totalCost = 0;
    if(distance <= parseFloat(baseDistance!)) {
        totalCost = parseFloat(costBase!);
    }else{
        totalCost = totalCost + parseFloat(costBase!);
        distance = distance - parseFloat(baseDistance!);
        totalCost = totalCost + distance * parseFloat(costPerKm!);
    }
    totalCost = totalCost + parseFloat(costDriverConvenience!);
    return Math.ceil(parseFloat(totalCost.toFixed(2)));
}