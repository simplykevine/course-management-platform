'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Users table
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'manager', 'facilitator', 'student'),
        allowNull: false,
        defaultValue: 'student'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE
      },
      reset_password_token: {
        type: Sequelize.STRING(255)
      },
      reset_password_expires: {
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Create Managers table - Fixed foreign key constraint
    await queryInterface.createTable('managers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Changed from SET NULL to CASCADE since user_id is NOT NULL
      },
      employee_id: {
        type: Sequelize.STRING(50),
        unique: true
      },
      department: {
        type: Sequelize.STRING(100)
      },
      management_level: {
        type: Sequelize.ENUM('senior', 'middle', 'junior'),
        defaultValue: 'junior'
      },
      can_approve_allocations: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Create Facilitators table - Fixed foreign key constraint
    await queryInterface.createTable('facilitators', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Changed from SET NULL to CASCADE since user_id is NOT NULL
      },
      employee_id: {
        type: Sequelize.STRING(50),
        unique: true
      },
      department: {
        type: Sequelize.STRING(100)
      },
      specialization: {
        type: Sequelize.STRING(255)
      },
      qualifications: {
        type: Sequelize.TEXT
      },
      experience_years: {
        type: Sequelize.INTEGER,
        validate: {
          min: 0
        }
      },
      max_course_load: {
        type: Sequelize.INTEGER,
        defaultValue: 4,
        validate: {
          min: 1,
          max: 10
        }
      },
      current_course_load: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Create Cohorts table
    await queryInterface.createTable('cohorts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      program: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Create Students table - Fixed foreign key constraint
    await queryInterface.createTable('students', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Changed from SET NULL to CASCADE since user_id is NOT NULL
      },
      student_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      cohort_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cohorts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      enrollment_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expected_graduation: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'graduated', 'withdrawn'),
        defaultValue: 'active'
      },
      gpa: {
        type: Sequelize.DECIMAL(3, 2),
        validate: {
          min: 0.0,
          max: 4.0
        }
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Create Modules table
    await queryInterface.createTable('modules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: {
          min: 1,
          max: 10
        }
      },
      level: {
        type: Sequelize.ENUM('100', '200', '300', '400', '500', '600'),
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Create Classes table
    await queryInterface.createTable('classes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 2020,
          max: 2100
        }
      },
      section: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Create Modes table
    await queryInterface.createTable('modes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT
      },
      requires_physical_presence: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Create Course Offerings table
    await queryInterface.createTable('course_offerings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cohort_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cohorts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      facilitator_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // This can be null if no facilitator assigned yet
        references: {
          model: 'facilitators',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // This is correct since facilitator_id can be null
      },
      mode_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      trimester: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 3
        }
      },
      intake_period: {
        type: Sequelize.ENUM('HT1', 'HT2', 'FT'),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      max_students: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        validate: {
          min: 1
        }
      },
      enrolled_students: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      status: {
        type: Sequelize.ENUM('planned', 'active', 'completed', 'cancelled'),
        defaultValue: 'planned'
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Create Activity Trackers table
    await queryInterface.createTable('activity_trackers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      allocation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'course_offerings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      week_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 16
        }
      },
      attendance: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      formative_one_grading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      formative_two_grading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      summative_grading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      course_moderation: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      intranet_sync: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      grade_book_status: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      submitted_at: {
        type: Sequelize.DATE
      },
      last_reminder_sent: {
        type: Sequelize.DATE
      },
      reminder_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });
    await queryInterface.addIndex('managers', ['employee_id'], { name: 'managers_employee_id_idx' });
    await queryInterface.addIndex('facilitators', ['employee_id'], { name: 'facilitators_employee_id_idx' });
    await queryInterface.addIndex('students', ['student_id'], { name: 'students_student_id_idx' });
    await queryInterface.addIndex('modules', ['level'], { name: 'modules_level_idx' });
    await queryInterface.addIndex('classes', ['year'], { name: 'classes_year_idx' });
    
    // Add unique constraint for course offerings
    await queryInterface.addIndex('course_offerings', 
      ['module_id', 'class_id', 'cohort_id', 'trimester', 'intake_period'], 
      { unique: true, name: 'course_unique_idx' }
    );
    await queryInterface.addIndex('course_offerings', ['status'], { name: 'course_offerings_status_idx' });
    await queryInterface.addIndex('course_offerings', ['trimester', 'intake_period'], { name: 'course_offerings_period_idx' });
    
    // Add unique constraint for activity trackers
    await queryInterface.addIndex('activity_trackers', 
      ['allocation_id', 'week_number'], 
      { unique: true, name: 'activity_unique_idx' }
    );
    await queryInterface.addIndex('activity_trackers', ['week_number'], { name: 'activity_trackers_week_idx' });
    await queryInterface.addIndex('activity_trackers', ['submitted_at'], { name: 'activity_trackers_submitted_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activity_trackers');
    await queryInterface.dropTable('course_offerings');
    await queryInterface.dropTable('modes');
    await queryInterface.dropTable('classes');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('students');
    await queryInterface.dropTable('cohorts');
    await queryInterface.dropTable('facilitators');
    await queryInterface.dropTable('managers');
    await queryInterface.dropTable('users');
  }
};