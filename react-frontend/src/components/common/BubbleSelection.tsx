import React, { useState } from 'react';
import { InputBase, Button, Typography, Box, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Option {
  id: string;
  name: string;
}

interface BubbleSelectionProps {
  label: string;
  options: Option[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
}

const BubbleSelection: React.FC<BubbleSelectionProps> = ({ label, options, selectedOptions, onOptionToggle }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(20); // Number of studies to show initially

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10); // Show 10 more studies each time
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">{label}</Typography>
      <Box
        display="flex"
        alignItems="center"
        sx={{
          mb: 2,
          p: 1,
          border: `1px solid gray`,
          borderRadius: '4px',
        }}
      >
        <SearchIcon sx={{ mr: 1 }} />
        <InputBase
          placeholder={`Search ${label}`}
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box
        display="flex"
        flexWrap="wrap"
        gap={1}
        sx={{
          p: 1,
          border: `1px solid gray`,
          borderRadius: '4px',
        }}
      >
        {filteredOptions.slice(0, visibleCount).map((option) => (
          <Chip
            key={option.id}
            label={option.name}
            onClick={() => onOptionToggle(option.id)}
            sx={{
              cursor: 'pointer',
              bgcolor: selectedOptions.includes(option.id) ? 'primary.main' : 'background.paper',
              color: selectedOptions.includes(option.id) ? 'primary.contrastText' : 'text.primary',
            }}
          />
        ))}
      </Box>
      {visibleCount < filteredOptions.length && (
        <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleShowMore}>
            Show More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BubbleSelection;
