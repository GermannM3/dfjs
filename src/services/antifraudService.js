const axios = require('axios');
const { User } = require('../models');

class AntiFraudService {
  static async checkUser(userData) {
    try {
      // Проверка IP через ip-api.com
      const ipInfo = await this.getIpInfo(userData.lastIp);
      
      // Проверка на мультиаккаунтинг
      const existingUsers = await this.checkMultipleAccounts(userData);
      
      // Проверка устройства
      const deviceCheck = await this.checkDevice(userData.deviceInfo);

      const riskScore = this.calculateRiskScore({
        ipInfo,
        existingUsers,
        deviceCheck
      });

      return {
        allowed: riskScore < 0.7,
        riskScore,
        reasons: this.getRiskReasons(riskScore)
      };
    } catch (error) {
      console.error('Anti-fraud check error:', error);
      return {
        allowed: false,
        riskScore: 1,
        reasons: ['Ошибка проверки безопасности']
      };
    }
  }

  static async getIpInfo(ip) {
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`);
      return response.data;
    } catch (error) {
      console.error('IP info fetch error:', error);
      return null;
    }
  }

  static async checkMultipleAccounts(userData) {
    return await User.findAll({
      where: {
        [Op.or]: [
          { lastIp: userData.lastIp },
          { deviceInfo: userData.deviceInfo }
        ]
      }
    });
  }

  static async checkDevice(deviceInfo) {
    // Здесь будет логика проверки устройства
    return {
      suspicious: false,
      reason: null
    };
  }

  static calculateRiskScore(checks) {
    let score = 0;
    
    // Логика подсчета риска
    if (checks.existingUsers.length > 0) score += 0.5;
    if (checks.deviceCheck.suspicious) score += 0.3;
    if (checks.ipInfo?.proxy) score += 0.4;

    return Math.min(score, 1);
  }

  static getRiskReasons(score) {
    const reasons = [];
    if (score >= 0.7) reasons.push('Высокий риск мультиаккаунтинга');
    if (score >= 0.4) reasons.push('Подозрительная активность');
    return reasons;
  }
}

module.exports = AntiFraudService; 