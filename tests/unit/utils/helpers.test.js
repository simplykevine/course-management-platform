const helpers = require('../../../src/utils/helpers');

describe('Helper Functions', () => {
  describe('generateRandomString', () => {
    it('should generate string of specified length', () => {
      const str = helpers.generateRandomString(16);
      expect(str).toHaveLength(16);
      expect(typeof str).toBe('string');
    });

    it('should generate different strings each time', () => {
      const str1 = helpers.generateRandomString(32);
      const str2 = helpers.generateRandomString(32);
      expect(str1).not.toBe(str2);
    });
  });

  describe('calculateOffset', () => {
    it('should calculate correct offset for pagination', () => {
      expect(helpers.calculateOffset(1, 10)).toBe(0);
      expect(helpers.calculateOffset(2, 10)).toBe(10);
      expect(helpers.calculateOffset(5, 20)).toBe(80);
    });
  });

  describe('formatPaginationResponse', () => {
    it('should format pagination metadata correctly', () => {
      const result = helpers.formatPaginationResponse(100, 3, 10);
      
      expect(result).toEqual({
        total: 100,
        page: 3,
        limit: 10,
        pages: 10,
        hasNext: true,
        hasPrev: true
      });
    });

    it('should handle edge cases', () => {
      const firstPage = helpers.formatPaginationResponse(50, 1, 10);
      expect(firstPage.hasPrev).toBe(false);
      expect(firstPage.hasNext).toBe(true);

      const lastPage = helpers.formatPaginationResponse(50, 5, 10);
      expect(lastPage.hasPrev).toBe(true);
      expect(lastPage.hasNext).toBe(false);
    });
  });

  describe('generateEmployeeId', () => {
    it('should generate employee ID with correct format', () => {
      const id = helpers.generateEmployeeId();
      expect(id).toMatch(/^EMP[A-Z0-9]+$/);
      expect(id.length).toBeGreaterThan(11);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(helpers.generateEmployeeId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateStudentId', () => {
    it('should generate student ID with current year', () => {
      const id = helpers.generateStudentId();
      const currentYear = new Date().getFullYear();
      expect(id).toMatch(new RegExp(`^${currentYear}\\d{5}$`));
    });

    it('should generate ID with specified year', () => {
      const id = helpers.generateStudentId(2025);
      expect(id).toMatch(/^2025\d{5}$/);
    });
  });

  describe('calculateWeekNumber', () => {
    it('should calculate correct week number', () => {
      const startDate = new Date('2025-01-01');
      const currentDate = new Date('2025-01-08'); // 7 days later
      expect(helpers.calculateWeekNumber(startDate, currentDate)).toBe(2);

      const laterDate = new Date('2025-01-15'); // 14 days later
      expect(helpers.calculateWeekNumber(startDate, laterDate)).toBe(3);
    });

    it('should handle same day as week 1', () => {
      const date = new Date('2025-01-01');
      expect(helpers.calculateWeekNumber(date, date)).toBe(1);
    });

    it('should handle dates before start date', () => {
      const startDate = new Date('2025-01-01');
      const beforeDate = new Date('2024-12-25');
      expect(helpers.calculateWeekNumber(startDate, beforeDate)).toBe(0);
    });

    it('should handle edge cases for week calculation', () => {
      const startDate = new Date('2025-01-01');
      
      // Day 1-6 should be week 1
      const day6 = new Date('2025-01-06');
      expect(helpers.calculateWeekNumber(startDate, day6)).toBe(1);
      
      // Day 7 should be week 2
      const day7 = new Date('2025-01-07');
      expect(helpers.calculateWeekNumber(startDate, day7)).toBe(1);
      
      // Day 8 should be week 2
      const day8 = new Date('2025-01-08');
      expect(helpers.calculateWeekNumber(startDate, day8)).toBe(2);
    });
  });

  describe('isValidDateRange', () => {
    it('should validate date ranges correctly', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-12-31');
      expect(helpers.isValidDateRange(start, end)).toBe(true);

      const invalidEnd = new Date('2024-12-31');
      expect(helpers.isValidDateRange(start, invalidEnd)).toBe(false);
    });

    it('should handle string dates', () => {
      expect(helpers.isValidDateRange('2025-01-01', '2025-12-31')).toBe(true);
      expect(helpers.isValidDateRange('2025-12-31', '2025-01-01')).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15');
      const formatted = helpers.formatDate(date);
      expect(formatted).toBe('January 15, 2025');
    });

    it('should handle string dates', () => {
      const formatted = helpers.formatDate('2025-12-25');
      expect(formatted).toBe('December 25, 2025');
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await helpers.sleep(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some margin
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags and trim whitespace', () => {
      expect(helpers.sanitizeInput('  hello  ')).toBe('hello');
      expect(helpers.sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(helpers.sanitizeInput('normal text')).toBe('normal text');
    });

    it('should handle non-string inputs', () => {
      expect(helpers.sanitizeInput(123)).toBe(123);
      expect(helpers.sanitizeInput(null)).toBe(null);
      expect(helpers.sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('hasRole', () => {
    it('should check if user has allowed role', () => {
      const user = { role: 'facilitator' };
      expect(helpers.hasRole(user, ['facilitator', 'manager'])).toBe(true);
      expect(helpers.hasRole(user, ['manager', 'admin'])).toBe(false);
      expect(helpers.hasRole(user, ['facilitator'])).toBe(true);
    });
  });

  describe('parseBoolean', () => {
    it('should parse various boolean representations', () => {
      expect(helpers.parseBoolean(true)).toBe(true);
      expect(helpers.parseBoolean(false)).toBe(false);
      expect(helpers.parseBoolean('true')).toBe(true);
      expect(helpers.parseBoolean('false')).toBe(false);
      expect(helpers.parseBoolean('1')).toBe(true);
      expect(helpers.parseBoolean('0')).toBe(false);
      expect(helpers.parseBoolean('yes')).toBe(true);
      expect(helpers.parseBoolean('no')).toBe(false);
    });
  });
});