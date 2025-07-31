require('dotenv').config();
const { notificationQueue, reminderQueue } = require('../config/redis');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

// Create email transporter (configure based on your email service)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const emailTemplates = {
  'activity-reminder': (data) => ({
    subject: data.subject,
    html: `
      <h2>Activity Log Reminder</h2>
      <p>Dear ${data.facilitatorName},</p>
      <p>This is a reminder to submit your activity log for:</p>
      <ul>
        <li><strong>Course:</strong> ${data.courseName}</li>
        <li><strong>Class:</strong> ${data.className}</li>
        <li><strong>Cohort:</strong> ${data.cohortName}</li>
        <li><strong>Week:</strong> ${data.weekNumber}</li>
      </ul>
      <p>Please submit your activity log by <strong>${new Date(data.dueDate).toLocaleString()}</strong>.</p>
      <p>Best regards,<br>Course Management System</p>
    `
  }),
  
  'manager-alert': (data) => ({
    subject: data.subject,
    html: `
      <h2>${data.alertType.replace(/-/g, ' ').toUpperCase()}</h2>
      <p>Dear ${data.managerName},</p>
      ${generateAlertContent(data.alertType, data)}
      <p>Best regards,<br>Course Management System</p>
    `
  })
};

function generateAlertContent(alertType, data) {
  switch (alertType) {
    case 'missing-activity-log':
      return `
        <p>The following activity log is missing:</p>
        <ul>
          <li><strong>Facilitator:</strong> ${data.facilitatorName}</li>
          <li><strong>Course:</strong> ${data.courseName}</li>
          <li><strong>Week:</strong> ${data.weekNumber}</li>
        </ul>
        <p>Please follow up with the facilitator.</p>
      `;
    
    case 'activity-submitted':
      return `
        <p>An activity log has been submitted:</p>
        <ul>
          <li><strong>Facilitator:</strong> ${data.facilitatorName}</li>
          <li><strong>Course:</strong> ${data.courseName}</li>
          <li><strong>Week:</strong> ${data.weekNumber}</li>
          <li><strong>Completion:</strong> ${data.completionPercentage}%</li>
          <li><strong>Submitted at:</strong> ${new Date(data.submittedAt).toLocaleString()}</li>
        </ul>
      `;
    
    case 'deadline-missed':
      return `
        <p>The deadline has been missed for:</p>
        <ul>
          <li><strong>Facilitator:</strong> ${data.facilitatorName}</li>
          <li><strong>Course:</strong> ${data.courseName}</li>
          <li><strong>Week:</strong> ${data.weekNumber}</li>
        </ul>
        <p>Immediate action required.</p>
      `;
    
    default:
      return '<p>System notification.</p>';
  }
}

// Process email notifications
notificationQueue.process('email', async (job) => {
  const { to, subject, template, data } = job.data;
  
  try {
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    const emailContent = emailTemplate({ ...data, subject });
    
    // In development, log the email instead of sending
    if (process.env.NODE_ENV === 'development') {
      logger.info('Email notification (dev mode):', {
        to,
        subject: emailContent.subject,
        template
      });
      return { success: true, mode: 'development' };
    }
    
    // Send actual email in production
    const info = await transporter.sendMail({
      from: `"Course Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    });
    
    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
});

// Process reminder notifications
reminderQueue.process('activity-reminder', async (job) => {
  try {
    // This processor could be expanded to handle different types of reminders
    logger.info('Processing reminder:', job.data);
    
    // Add the actual notification to the notification queue
    await notificationQueue.add('email', job.data);
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to process reminder:', error);
    throw error;
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing queues...');
  await notificationQueue.close();
  await reminderQueue.close();
  process.exit(0);
});

logger.info('Notification worker started');
logger.info(`Processing queues: notifications, reminders`);

// Keep the worker running
process.stdin.resume();