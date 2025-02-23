const NodeGeocoder = require('node-geocoder');

const geocoder = NodeGeocoder({
  provider: 'openstreetmap', // Free geocoding service
});

class GeoService {
  static async getCoordinates(address) {
    try {
      const result = await geocoder.geocode(address);
      if (result.length > 0) {
        return {
          lat: result[0].latitude,
          lon: result[0].longitude
        };
      }
      throw new Error('Location not found');
    } catch (error) {
      throw new Error(`Geocoding error: ${error.message}`);
    }
  }

  static calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lon - point1.lon);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRad(value) {
    return value * Math.PI / 180;
  }
}

module.exports = GeoService;