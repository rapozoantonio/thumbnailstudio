// src/components/AssetLibrary.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, TextField, MenuItem, Select, InputLabel, FormControl, Chip, Button, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

// Asset type definition
interface Asset {
  src: string;
  name: string;
  type: string;
  position: 'left' | 'right' | 'center';
}

interface AssetLibraryProps {
  assets: Asset[];
  onSelect: (asset: Asset) => void;
}

// Styled components
const AssetItemPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(55, 65, 81, 0.8)',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  '&:hover': {
    background: 'rgba(75, 85, 99, 0.9)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
}));

const AssetImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '70px',
  objectFit: 'contain',
  marginBottom: '8px',
});

const AssetNameTypography = styled(Typography)({
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.7)',
  textAlign: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '100%',
});

const CategoryChip = styled(Chip)(({ theme, active }) => ({
  backgroundColor: active ? theme.palette.primary.main : 'rgba(55, 65, 81, 0.8)',
  color: active ? theme.palette.primary.contrastText : 'rgba(255, 255, 255, 0.7)',
  margin: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : 'rgba(75, 85, 99, 0.9)',
  },
}));

/**
 * AssetLibrary Component - Provides asset browsing, filtering, and selection
 */
const AssetLibrary: React.FC<AssetLibraryProps> = ({ assets, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<'left' | 'right' | 'center'>('left');
  const [webAssets, setWebAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch GIFs from Giphy API if active category is "web"
  useEffect(() => {
    const fetchGifs = async () => {
      if (searchTerm.trim() === '') {
        setWebAssets([]);
        return;
      }

      setIsLoading(true);
      
      try {
        // Use Giphy API to search for GIFs
        const res = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=ubh7ku2ntsDJnpXSabMD2KnZKGw5p7HL&q=${encodeURIComponent(
            searchTerm
          )}&limit=9`
        );
        
        if (!res.ok) {
          throw new Error('Failed to fetch GIFs');
        }
        
        const data = await res.json();
        
        // Map Giphy results to Asset format
        const results: Asset[] = data.data.map((gif: any) => ({
          src: gif.images.fixed_height_small.url,
          name: gif.title || 'GIF',
          type: 'web',
          position: selectedPosition, // Use currently selected position
        }));
        
        setWebAssets(results);
      } catch (error) {
        console.error('Error fetching GIFs:', error);
        setWebAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeCategory === 'web') {
      fetchGifs();
    }
  }, [searchTerm, activeCategory, selectedPosition]);

  // Define all categories including web assets
  const categories = ['all', ...Array.from(new Set(assets.map(asset => asset.type))), 'web'];

  // Determine the list to use based on category
  const assetList = activeCategory === 'web' ? webAssets : assets;

  // Filter assets based on category and search term
  const filteredAssets = assetList.filter(asset => {
    const matchesCategory = activeCategory === 'all' || asset.type === activeCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle selecting an asset
  const handleAssetSelect = (asset: Asset) => {
    onSelect({ ...asset, position: selectedPosition });
  };

  // Handle position change
  const handlePositionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedPosition(event.target.value as 'left' | 'right' | 'center');
  };

  // File upload handling
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Handle image file upload
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!evt.target?.result) return;
      
      onSelect({
        src: evt.target.result as string,
        name: file.name,
        type: 'uploaded',
        position: selectedPosition,
      });
      
      // Reset file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Search and Alignment Controls */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(55, 65, 81, 0.8)',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(75, 85, 99, 0.9)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(59, 130, 246, 0.8)',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel id="position-select-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Position</InputLabel>
            <Select
              labelId="position-select-label"
              value={selectedPosition}
              onChange={handlePositionChange}
              label="Position"
              sx={{
                backgroundColor: 'rgba(55, 65, 81, 0.8)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(75, 85, 99, 0.9)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(59, 130, 246, 0.8)',
                },
              }}
            >
              <MenuItem value="left">Left Aligned</MenuItem>
              <MenuItem value="right">Right Aligned</MenuItem>
              <MenuItem value="center">Center Aligned</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Category Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
        {categories.map((category) => (
          <CategoryChip
            key={category}
            label={category.charAt(0).toUpperCase() + category.slice(1)}
            onClick={() => setActiveCategory(category)}
            active={activeCategory === category}
            size="small"
          />
        ))}
        
        {/* Upload Button */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          size="small"
          onClick={handleUploadClick}
          sx={{
            ml: 1,
            color: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(75, 85, 99, 0.9)',
            '&:hover': {
              borderColor: 'rgba(59, 130, 246, 0.8)',
              backgroundColor: 'rgba(55, 65, 81, 0.8)',
            },
          }}
        >
          Upload
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Box>

      {/* Asset Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Grid container spacing={1} sx={{ maxHeight: '320px', overflowY: 'auto', mt: 1, pb: 1 }}>
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset, index) => (
              <Grid item xs={6} key={`${asset.type}-${index}`}>
                <AssetItemPaper onClick={() => handleAssetSelect(asset)}>
                  <AssetImage src={asset.src} alt={asset.name} />
                  <AssetNameTypography>{asset.name}</AssetNameTypography>
                </AssetItemPaper>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {activeCategory === 'web' && searchTerm.trim() === '' 
                    ? 'Enter a search term to find GIFs' 
                    : 'No assets found. Try a different search term.'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default AssetLibrary;