<?php

use yii\db\Migration;

/**
 * Class m250526_143552_insert_data
 */
class m250526_143552_insert_data extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Clear existing data from all tables except studies and school_levels
        $this->execute('SET FOREIGN_KEY_CHECKS=0');
        
        $this->truncateTable('applications');
        $this->truncateTable('exams');
        $this->truncateTable('exam_questions');
        $this->truncateTable('exam_results');
        $this->truncateTable('links');
        $this->truncateTable('period');
        $this->truncateTable('refresh_tokens');
        $this->truncateTable('saved_schools');
        $this->truncateTable('school');
        $this->truncateTable('school_level_assignments');
        $this->truncateTable('student');
        $this->truncateTable('student_answers');
        $this->truncateTable('users');
        $this->truncateTable('user_studies');
        
        $this->execute('SET FOREIGN_KEY_CHECKS=1');

        // Insert test users - expanded with more users
        $this->batchInsert('users', ['id', 'email', 'password_hash', 'user_type'], [
            [1, 'school1@example.com', Yii::$app->security->generatePasswordHash('password1'), 'school'],
            [2, 'student1@example.com', Yii::$app->security->generatePasswordHash('password1'), 'student'],
            [3, 'school2@example.com', Yii::$app->security->generatePasswordHash('password2'), 'school'],
            [4, 'student2@example.com', Yii::$app->security->generatePasswordHash('password2'), 'student'],
            [5, 'school3@example.com', Yii::$app->security->generatePasswordHash('password3'), 'school'],
            [6, 'student3@example.com', Yii::$app->security->generatePasswordHash('password3'), 'student'],
            [7, 'student4@example.com', Yii::$app->security->generatePasswordHash('password4'), 'student'],
            [8, 'school4@example.com', Yii::$app->security->generatePasswordHash('password4'), 'school'],
        ]);

        // Insert test schools - expanded with more schools and varied data
        $this->batchInsert('school', ['user_id', 'name', 'address', 'description', 'school_year_start', 'school_year_end', 'primary_color', 'secondary_color'], [
            [1, 'Greenwood High', '123 Education Blvd, Greenwood', 'A leading institution focused on holistic education', '2024-08-15', '2025-05-30', '#2E8B57', '#FFFFFF'],
            [3, 'Riverside Academy', '456 Learning Lane, Riverside', 'Innovative learning environment with STEM focus', '2024-09-01', '2025-06-15', '#1E90FF', '#FFD700'],
            [5, 'Summit International School', '789 Knowledge St, Summit', 'International curriculum with multicultural environment', '2024-08-20', '2025-06-10', '#8B0000', '#F5F5DC'],
            [8, 'Horizon Prep', '321 Future Ave, Horizon City', 'College preparatory school with excellent track record', '2024-09-05', '2025-06-20', '#000080', '#FFFFFF'],
        ]);

        // Insert test students - expanded with more students
        $this->batchInsert('student', ['user_id', 'name', 'dob'], [
            [2, 'Emma Johnson', '2008-03-15'],
            [4, 'Liam Smith', '2009-05-22'],
            [6, 'Olivia Williams', '2007-11-30'],
            [7, 'Noah Brown', '2008-07-10'],
        ]);

        // Insert test applications - expanded with more varied statuses and dates
        $this->batchInsert('applications', ['student_id', 'school_id', 'expiration_date', 'status', 'start_date'], [
            [2, 1, '2025-01-31', 'pending', '2024-11-15 10:00:00'],
            [2, 3, '2025-02-15', 'approved', '2024-11-20 14:30:00'],
            [4, 1, '2025-03-01', 'denied', '2024-12-01 09:15:00'],
            [4, 5, '2025-02-28', 'approved', '2024-12-05 11:45:00'],
            [6, 8, '2025-03-15', 'pending', '2024-12-10 16:20:00'],
            [7, 3, '2025-01-15', 'approved', '2024-11-25 13:10:00'],
            [7, 5, '2025-02-20', 'invited', '2024-12-15 10:30:00'],
        ]);

        // Insert test exams - expanded with more exams and varied data
        $this->batchInsert('exams', ['school_id', 'name', 'time_needed_minutes', 'is_mandatory', 'study_id'], [
            [1, 'Mathematics Entrance Exam', 90, 1, 1],
            [1, 'English Proficiency Test', 60, 1, 2],
            [3, 'Science Assessment', 75, 1, 3],
            [3, 'Creative Writing', 45, 0, 4],
            [5, 'International Baccalaureate Screening', 120, 1, 5],
            [5, 'Language Aptitude Test', 50, 0, 6],
            [8, 'Comprehensive Admission Test', 100, 1, 7],
            [8, 'Logical Reasoning', 40, 0, 8],
        ]);

        // Insert test exam questions - expanded with more questions
        $this->batchInsert('exam_questions', ['exam_id', 'question_text', 'choices', 'question_type', 'correct_answer', 'max_points'], [
            // Math Exam Questions
            [1, 'What is 15% of 200?', '15,20,30,45', 'MCQ', '30', 2],
            [1, 'Solve for x: 2x + 5 = 15', '5,7,10,12', 'MCQ', '5', 2],
            [1, 'Explain the quadratic formula and its uses.', '', 'LTA', '', 10],
            
            // English Questions
            [2, 'Choose the correct sentence:', 'He don\'t like apples.,He doesn\'t likes apples.,He doesn\'t like apples.,He not like apples.', 'MCQ', 'He doesn\'t like apples.', 3],
            [2, 'Write a 200-word essay on your favorite book.', '', 'LTA', '', 20],
            
            // Science Questions
            [3, 'What is the chemical symbol for gold?', 'Au,Ag,Go,Ge', 'MCQ', 'Au', 1],
            [3, 'Describe Newton\'s Three Laws of Motion.', '', 'LTA', '', 15],
            
            // Creative Writing Questions
            [4, 'Write a short story about a memorable journey.', '', 'LTA', '', 25],
            
            // IB Screening Questions
            [5, 'What is the capital of Brazil?', 'Rio de Janeiro,São Paulo,Brasília,Buenos Aires', 'MCQ', 'Brasília', 2],
            [5, 'Discuss the causes and effects of climate change.', '', 'LTA', '', 20],
            
            // Language Aptitude Questions
            [6, 'Which word is different?', 'happy,joyful,elated,angry', 'MCQ', 'angry', 3],
            
            // Comprehensive Test Questions
            [7, 'If a train travels 300 miles in 5 hours, what is its average speed?', '50 mph,55 mph,60 mph,65 mph', 'MCQ', '60 mph', 5],
            [7, 'Analyze the theme of conflict in a novel of your choice.', '', 'LTA', '', 25],
            
            // Logical Reasoning Questions
            [8, 'Complete the sequence: 2, 4, 8, 16, ___', '24,28,32,36', 'MCQ', '32', 5],
        ]);

        // Insert test student answers - expanded with correct question IDs
        $this->batchInsert('student_answers', ['student_id', 'exam_id', 'question_id', 'answer', 'points'], [
            // Emma's answers
            [2, 1, 1, '30', 2],
            [2, 1, 2, '5', 2],
            [2, 1, 3, 'The quadratic formula is x = [-b ± √(b²-4ac)]/2a and it\'s used to find the roots of quadratic equations.', 8],
            [2, 2, 4, 'He doesn\'t like apples.', 3],
            [2, 2, 5, 'My favorite book is "To Kill a Mockingbird"... (essay content truncated for example)', 18],
            
            // Liam's answers
            [4, 1, 1, '30', 2],
            [4, 1, 2, '10', 0],
            [4, 1, 3, 'Quadratic formula solves ax²+bx+c=0', 6],
            [4, 3, 6, 'Au', 1],
            [4, 3, 7, 'Newton\'s first law is about inertia...', 12],
            
            // Noah's answers
            [7, 3, 6, 'Au', 1],
            [7, 3, 7, 'First law: objects in motion stay in motion...', 10],
            [7, 8, 13, '32', 5],
            
            // Olivia's answers
            [6, 5, 9, 'Brasília', 2],
            [6, 5, 10, 'Climate change is caused by greenhouse gases...', 18],
            [6, 7, 11, '60 mph', 5],
            [6, 7, 12, 'In "1984", the theme of conflict is shown through...', 22],
        ]);

        // Insert test exam results - expanded with more results
        $this->batchInsert('exam_results', ['exam_id', 'student_id', 'score', 'max_points', 'status'], [
            [1, 2, 85.5, 100, 'checked'],
            [1, 4, 72.0, 100, 'checked'],
            [2, 2, 92.0, 100, 'checked'],
            [3, 4, 88.5, 100, 'checked'],
            [3, 7, 65.0, 100, 'checked'],
            [5, 6, 78.0, 100, 'pending'],
            [7, 6, 91.5, 100, 'checked'],
            [8, 7, 84.0, 100, 'checked'],
        ]);

        // Insert test periods - expanded with more periods
        $this->batchInsert('period', ['school_id', 'name', 'start_date', 'end_date', 'type'], [
            [1, 'Fall Semester 2024', '2024-08-15', '2024-12-20', 'school year'],
            [1, 'Spring Semester 2025', '2025-01-07', '2025-05-30', 'school year'],
            [3, 'Academic Year 2024-2025', '2024-09-01', '2025-06-15', 'school year'],
            [5, 'Term 1', '2024-08-20', '2024-12-15', 'school year'],
            [5, 'Term 2', '2025-01-10', '2025-04-10', 'school year'],
            [5, 'Term 3', '2025-04-21', '2025-06-10', 'school year'],
            [8, 'Fall Quarter', '2024-09-05', '2024-12-15', 'school year'],
            [8, 'Winter Quarter', '2025-01-05', '2025-03-20', 'school year'],
            [8, 'Spring Quarter', '2025-03-31', '2025-06-20', 'school year'],
        ]);

        // Insert test links - expanded with correct author_ids
        $this->batchInsert('links', ['url', 'type', 'author_id', 'application_id', 'question_id', 'answer_id'], [
            ['https://example.com/profiles/school1.jpg', 'Profile Image', 1, null, null, null],
            ['https://example.com/profiles/school2.jpg', 'Profile Image', 3, null, null, null],
            ['https://example.com/profiles/school3.jpg', 'Profile Image', 5, null, null, null],
            ['https://example.com/profiles/school4.jpg', 'Profile Image', 8, null, null, null],
            ['https://example.com/profiles/student1.jpg', 'Profile File', null, null, null, null],
            ['https://example.com/profiles/student2.jpg', 'Profile File', null, null, null, null],
            ['https://example.com/docs/application1.pdf', 'Application', null, 1, null, null],
            ['https://example.com/docs/recommendation2.pdf', 'Application', null, 3, null, null],
            ['https://example.com/questions/math1.png', 'Question', null, null, 3, null],
            ['https://example.com/answers/essay2.pdf', 'Answer', null, null, null, 5],
        ]);

        // Insert test school level assignments - expanded
        $this->batchInsert('school_level_assignments', ['school_id', 'level_id'], [
            [1, 1], [1, 2], [1, 3], // Greenwood offers elementary, middle, high
            [3, 2], [3, 3],         // Riverside offers middle and high
            [5, 1], [5, 2], [5, 3], [5, 4], // Summit offers all levels plus preschool
            [8, 3], [8, 4],           // Horizon offers high school and college prep
        ]);

        // Insert test user studies - expanded
        $this->batchInsert('user_studies', ['user_id', 'study_id'], [
            [2, 1], [2, 2], // Emma studies Math and English
            [4, 3], [4, 4], // Liam studies Science and Creative Writing
            [6, 5], [6, 7], // Olivia studies IB and Comprehensive
            [7, 3], [7, 8], // Noah studies Science and Logical Reasoning
        ]);

        // Insert test saved schools - expanded
        $this->batchInsert('saved_schools', ['student_id', 'school_id'], [
            [2, 1], [2, 3], // Emma saved Greenwood and Riverside
            [4, 1], [4, 5], // Liam saved Greenwood and Summit
            [6, 5], [6, 8], // Olivia saved Summit and Horizon
            [7, 3],         // Noah saved Riverside
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        // Remove all inserted data
        $this->delete('saved_schools');
        $this->delete('user_studies');
        $this->delete('school_level_assignments');
        $this->delete('links');
        $this->delete('period');
        $this->delete('student_answers');
        $this->delete('exam_results');
        $this->delete('exam_questions');
        $this->delete('exams');
        $this->delete('applications');
        $this->delete('student');
        $this->delete('school');
        $this->delete('users');
    }
}