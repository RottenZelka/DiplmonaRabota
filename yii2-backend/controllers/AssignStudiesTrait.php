<?php

namespace app\controllers;

use Yii;

trait AssignStudiesTrait
{
    /**
     * Assign studies to a given user.
     *
     * @param int $userId
     * @param array $studyIds
     * @return array
     */
    public function assignStudies(int $userId, array $studyIds): array
    {
        $assignedStudies = [];

        // The model for user studies
        $modelClass = '\app\models\UserStudies';
        $entityColumn = 'user_id';

        foreach ($studyIds as $studyId) {
            // Check if assignment already exists
            $exists = $modelClass::find()
                ->where([$entityColumn => $userId, 'study_id' => $studyId])
                ->exists();

            if (!$exists) {
                // Create new assignment for the user
                $assignment = new $modelClass();
                $assignment->$entityColumn = $userId;
                $assignment->study_id = $studyId; // Assuming 'study_id' is the field to link with Study model

                if ($assignment->save()) {
                    $assignedStudies[] = $studyId;
                }
            }
        }

        return $assignedStudies;
    }
}
