import { useState, useEffect } from 'react';
import { saveSchool, deleteSavedSchoolId, getSavedSchools } from '../services/api';

interface SavedSchool {
  id: string;
  student_id: string;
  school_id: string;
  school_name: string;
  student_name: string;
  level_names?: string[];
}

export const useSaveSchool = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(null);

  const checkSavedStatus = async (schoolId: string) => {
    try {
      const response = await getSavedSchools();
      if (response && response.status === 'success' && Array.isArray(response.saved_schools)) {
        const saved = response.saved_schools.some((school: SavedSchool) => school.school_id === schoolId);
        setIsSaved(saved);
        setCurrentSchoolId(schoolId);
      }
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const saveSchoolHandler = async (schoolId: string) => {
    setIsSaving(true);
    setError(null);
    try {
      if (isSaved) {
        await deleteSavedSchoolId(schoolId);
        setIsSaved(false);
      } else {
        await saveSchool(schoolId);
        setIsSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update saved status');
    } finally {
      setIsSaving(false);
    }
  };

  // Check saved status when schoolId changes
  useEffect(() => {
    if (currentSchoolId) {
      checkSavedStatus(currentSchoolId);
    }
  }, [currentSchoolId]);

  return {
    saveSchool: saveSchoolHandler,
    isSaving,
    error,
    isSaved,
    checkSavedStatus
  };
}; 