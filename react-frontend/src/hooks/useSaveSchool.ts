import { useState } from 'react';
import { saveSchool, deleteSavedSchoolId, getSavedSchools } from '../services/api';

export const useSaveSchool = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const saveSchoolHandler = async (schoolId: string) => {
    setIsSaving(true);
    setError(null);
    try {
      if (isSaved) {
        await deleteSavedSchoolId(schoolId);
      } else {
        await saveSchool(schoolId);
      }
      setIsSaved(!isSaved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update saved status');
    } finally {
      setIsSaving(false);
    }
  };

  const checkSavedStatus = async (schoolId: string) => {
    try {
      const response = await getSavedSchools();
      const saved = response.some((school: any) => school.school_id === schoolId);
      setIsSaved(saved);
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  return {
    saveSchool: saveSchoolHandler,
    isSaving,
    error,
    isSaved,
    checkSavedStatus
  };
}; 