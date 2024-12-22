<?php

use yii\db\Migration;

/**
 * Class m241221_103743_insert_studies_and_school_levels
 */
class m241221_103743_insert_studies_and_school_levels extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Insert predefined school levels
        $this->batchInsert(
            '{{%school_levels}}',
            ['name'], // Column to insert data into
            [
                // Primary and Secondary Education Levels
                ['Preschools and Kindergartens'],
                ['Primary Schools'],
                ['Middle Schools'],
                ['High Schools'],
                ['Special Education Schools'],
        
                // Higher Education Levels
                ['Colleges'],
                ['Universities'],
                ['Community Colleges'],
                ['Polytechnic Institutes'],
                ['Vocational Schools'],
                ['Graduate Schools'],
                ['Medical Schools'],
                ['Law Schools'],
                ['Business Schools'],
        
                // Training and Skill Development Levels
                ['Technical Schools'],
                ['Language Schools'],
                ['Art Schools'],
                ['Driving Schools'],
                ['Professional Development Centers'],
                ['Culinary Schools'],
        
                // Alternative Education Levels
                ['Online Schools and eLearning Platforms'],
                ['Homeschooling Networks'],
                ['Charter Schools'],
                ['Montessori Schools'],
                ['Religious Schools'],
        
                // Specialized Education Levels
                ['STEM Centers'],
                ['Tutoring Centers'],
                ['Research Institutes'],
                ['Gifted and Talented Programs'],
                ['Adult Education Centers'],
        
                // Non-Traditional Education Levels
                ['Learning Pods'],
                ['Maker Spaces'],
                ['Outdoor Education Centers'],
                ['Cultural Centers'],
            ]
        );
        

        $this->batchInsert('{{%studies}}', ['name'], [
            ['Mathematics'],
            ['English Language and Literature'],
            ['Physics'],
            ['Chemistry'],
            ['Biology'],
            ['History'],
            ['Geography'],
            ['Social Studies'],
            ['Economics'],
            ['Civics and Government'],
            ['Environmental Science'],
            ['Statistics'],
            ['Spanish'],
            ['French'],
            ['German'],
            ['Chinese (Mandarin)'],
            ['Japanese'],
            ['Italian'],
            ['Russian'],
            ['Arabic'],
            ['Latin'],
            ['Sign Language'],
            ['Drawing'],
            ['Painting'],
            ['Sculpture'],
            ['Photography'],
            ['Music (Vocal)'],
            ['Music (Instrumental)'],
            ['Dance'],
            ['Theater'],
            ['Philosophy'],
            ['Religious Studies'],
            ['World Literature'],
            ['Comparative Literature'],
            ['Creative Writing'],
            ['Art History'],
            ['Film Studies'],
            ['Computer Science'],
            ['Information Technology'],
            ['Civil Engineering'],
            ['Mechanical Engineering'],
            ['Electrical Engineering'],
            ['Software Engineering'],
            ['Astronomy'],
            ['Data Science'],
            ['Robotics'],
            ['Artificial Intelligence'],
            ['Cybersecurity'],
            ['Geology'],
            ['Genetics'],
            ['Culinary Arts'],
            ['Automotive Technology'],
            ['Welding'],
            ['Carpentry'],
            ['Plumbing'],
            ['Electrical Installation'],
            ['Fashion Design'],
            ['Cosmetology'],
            ['HVAC Systems'],
            ['Agricultural Science'],
            ['Physical Education'],
            ['Health Science'],
            ['Nutrition and Dietetics'],
            ['Nursing'],
            ['First Aid and CPR'],
            ['Sports Science'],
            ['Kinesiology'],
            ['Public Health'],
            ['Mental Health Studies'],
            ['Business Studies'],
            ['Marketing'],
            ['Accounting'],
            ['Entrepreneurship'],
            ['Management'],
            ['Finance'],
            ['Human Resources'],
            ['International Business'],
            ['Real Estate'],
            ['Supply Chain Management'],
            ['Law'],
            ['Criminology'],
            ['Psychology'],
            ['Sociology'],
            ['Anthropology'],
            ['Archaeology'],
            ['Political Science'],
            ['Ethics'],
            ['Linguistics'],
            ['Cultural Studies'],
            ['Web Development'],
            ['Graphic Design'],
            ['Video Game Development'],
            ['Digital Marketing'],
            ['Animation'],
            ['Video Production'],
            ['UX/UI Design'],
            ['Blockchain Technology'],
            ['Virtual Reality and Augmented Reality'],
            ['Social Media Management'],
            ['Environmental Studies'],
            ['Urban Planning'],
            ['Architecture'],
            ['Forestry'],
            ['Oceanography'],
            ['Meteorology'],
            ['Fashion Merchandising'],
            ['Forensic Science'],
            ['Military Science'],
            ['Library and Information Science'],
            ['Driving Education'],
            ['Heavy Machinery Operation'],
            ['Forklift Operation'],
            ['Flight Training (Pilot Certification)'],
            ['Maritime Studies (Sailing/Boating)'],
            ['Emergency Response Training'],
            ['Dog Training'],
            ['Cooking and Baking'],
            ['Bartending'],
            ['Personal Fitness Training'],
            ['Yoga and Meditation'],
            ['Photography (Advanced)'],
            ['Event Management'],
            ['Public Speaking'],
            ['Language Translation'],
            ['Calligraphy'],
            ['Tattoo Artistry'],
        ]); 
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
{
    // Delete all entries from the 'school_levels' table
    $this->delete('{{%school_levels}}', [
        'name' => [
            // Primary and Secondary Education Levels
            'Preschools and Kindergartens',
            'Primary Schools',
            'Middle Schools',
            'High Schools',
            'Special Education Schools',

            // Higher Education Levels
            'Colleges',
            'Universities',
            'Community Colleges',
            'Polytechnic Institutes',
            'Vocational Schools',
            'Graduate Schools',
            'Medical Schools',
            'Law Schools',
            'Business Schools',

            // Training and Skill Development Levels
            'Technical Schools',
            'Language Schools',
            'Art Schools',
            'Driving Schools',
            'Professional Development Centers',
            'Culinary Schools',

            // Alternative Education Levels
            'Online Schools and eLearning Platforms',
            'Homeschooling Networks',
            'Charter Schools',
            'Montessori Schools',
            'Religious Schools',

            // Specialized Education Levels
            'STEM Centers',
            'Tutoring Centers',
            'Research Institutes',
            'Gifted and Talented Programs',
            'Adult Education Centers',

            // Non-Traditional Education Levels
            'Learning Pods',
            'Maker Spaces',
            'Outdoor Education Centers',
            'Cultural Centers',
        ]
    ]);

    // Delete all entries from the 'studies' table
    $this->delete('{{%studies}}', [
        'name' => [
            'Mathematics',
            'English Language and Literature',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Geography',
            'Social Studies',
            'Economics',
            'Civics and Government',
            'Environmental Science',
            'Statistics',
            'Spanish',
            'French',
            'German',
            'Chinese (Mandarin)',
            'Japanese',
            'Italian',
            'Russian',
            'Arabic',
            'Latin',
            'Sign Language',
            'Drawing',
            'Painting',
            'Sculpture',
            'Photography',
            'Music (Vocal)',
            'Music (Instrumental)',
            'Dance',
            'Theater',
            'Philosophy',
            'Religious Studies',
            'World Literature',
            'Comparative Literature',
            'Creative Writing',
            'Art History',
            'Film Studies',
            'Computer Science',
            'Information Technology',
            'Civil Engineering',
            'Mechanical Engineering',
            'Electrical Engineering',
            'Software Engineering',
            'Astronomy',
            'Data Science',
            'Robotics',
            'Artificial Intelligence',
            'Cybersecurity',
            'Geology',
            'Genetics',
            'Culinary Arts',
            'Automotive Technology',
            'Welding',
            'Carpentry',
            'Plumbing',
            'Electrical Installation',
            'Fashion Design',
            'Cosmetology',
            'HVAC Systems',
            'Agricultural Science',
            'Physical Education',
            'Health Science',
            'Nutrition and Dietetics',
            'Nursing',
            'First Aid and CPR',
            'Sports Science',
            'Kinesiology',
            'Public Health',
            'Mental Health Studies',
            'Business Studies',
            'Marketing',
            'Accounting',
            'Entrepreneurship',
            'Management',
            'Finance',
            'Human Resources',
            'International Business',
            'Real Estate',
            'Supply Chain Management',
            'Law',
            'Criminology',
            'Psychology',
            'Sociology',
            'Anthropology',
            'Archaeology',
            'Political Science',
            'Ethics',
            'Linguistics',
            'Cultural Studies',
            'Web Development',
            'Graphic Design',
            'Video Game Development',
            'Digital Marketing',
            'Animation',
            'Video Production',
            'UX/UI Design',
            'Blockchain Technology',
            'Virtual Reality and Augmented Reality',
            'Social Media Management',
            'Environmental Studies',
            'Urban Planning',
            'Architecture',
            'Forestry',
            'Oceanography',
            'Meteorology',
            'Fashion Merchandising',
            'Forensic Science',
            'Military Science',
            'Library and Information Science',
            'Driving Education',
            'Heavy Machinery Operation',
            'Forklift Operation',
            'Flight Training (Pilot Certification)',
            'Maritime Studies (Sailing/Boating)',
            'Emergency Response Training',
            'Dog Training',
            'Cooking and Baking',
            'Bartending',
            'Personal Fitness Training',
            'Yoga and Meditation',
            'Photography (Advanced)',
            'Event Management',
            'Public Speaking',
            'Language Translation',
            'Calligraphy',
            'Tattoo Artistry',
        ]
    ]);
}

}