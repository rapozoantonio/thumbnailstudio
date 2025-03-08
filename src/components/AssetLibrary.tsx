// src/components/AssetLibrary.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, TextField, Chip, Button, Grid, Paper, ToggleButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon, Search as SearchIcon, Wallpaper as WallpaperIcon, Image as ImageIcon } from '@mui/icons-material';

// Updated Asset type definition (removed position, added isBackground)
interface Asset {
  src: string;
  name: string;
  type: string;
  isBackground?: boolean;
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
  position: 'relative', // For background toggle positioning
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

const CategoryChip = styled(Chip)(({ theme, active }: { theme: any; active: boolean }) => ({
  backgroundColor: active ? theme.palette.primary.main : 'rgba(55, 65, 81, 0.8)',
  color: active ? theme.palette.primary.contrastText : 'rgba(255, 255, 255, 0.7)',
  margin: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : 'rgba(75, 85, 99, 0.9)',
  },
}));

// New styled component for the mode toggle
const ModeToggleGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  backgroundColor: 'rgba(55, 65, 81, 0.8)',
  borderRadius: theme.shape.borderRadius,
  padding: '4px',
  marginLeft: 'auto',
}));

const ModeToggleButton = styled(ToggleButton)(({ theme, active }: { theme: any; active: boolean }) => ({
  padding: '4px 10px',
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? theme.palette.primary.contrastText : 'rgba(255, 255, 255, 0.7)',
  border: 'none',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : 'rgba(75, 85, 99, 0.9)',
  },
  '&.MuiToggleButton-root': {
    border: 'none',
  },
}));

/**
 * AssetLibrary Component - Provides asset browsing, filtering, and selection
 * with background setting capability
 */
const AssetLibrary: React.FC<AssetLibraryProps> = ({ assets, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [webAssets, setWebAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assetMode, setAssetMode] = useState<'element' | 'background'>('element');
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
        
        // Map Giphy results to Asset format (now without position)
        const results: Asset[] = data.data.map((gif: any) => ({
          src: gif.images.fixed_height_small.url,
          name: gif.title || 'GIF',
          type: 'web',
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
  }, [searchTerm, activeCategory]);

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
    // Add isBackground property based on current mode
    onSelect({ 
      ...asset, 
      isBackground: assetMode === 'background' 
    });
  };

  // Toggle between element and background modes
  const handleModeChange = (newMode: 'element' | 'background') => {
    setAssetMode(newMode);
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
        isBackground: assetMode === 'background'
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
      {/* Search Bar */}
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
      </Grid>

      {/* Upload Button - Dedicated Row */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddIcon />}
        size="small"
        onClick={handleUploadClick}
        sx={{
          mb: 2,
          py: 1,
          color: 'rgba(255, 255, 255, 0.7)',
          borderColor: 'rgba(75, 85, 99, 0.9)',
          backgroundColor: 'rgba(55, 65, 81, 0.8)',
          '&:hover': {
            borderColor: 'rgba(59, 130, 246, 0.8)',
            backgroundColor: 'rgba(55, 65, 81, 0.9)',
          },
        }}
      >
        Upload New Asset
      </Button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Simple Asset Type Selector */}
      <Box sx={{ 
        display: 'flex', 
        mb: 2,
        backgroundColor: 'rgba(55, 65, 81, 0.8)',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <Box 
          onClick={() => handleModeChange('element')}
          sx={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 1,
            cursor: 'pointer',
            backgroundColor: assetMode === 'element' ? 'primary.main' : 'transparent',
            color: assetMode === 'element' ? 'primary.contrastText' : 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: assetMode === 'element' ? 'primary.dark' : 'rgba(75, 85, 99, 0.9)',
            }
          }}
        >
          <ImageIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">Element</Typography>
        </Box>
        <Box 
          onClick={() => handleModeChange('background')}
          sx={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 1,
            cursor: 'pointer',
            backgroundColor: assetMode === 'background' ? 'primary.main' : 'transparent',
            color: assetMode === 'background' ? 'primary.contrastText' : 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: assetMode === 'background' ? 'primary.dark' : 'rgba(75, 85, 99, 0.9)',
            }
          }}
        >
          <WallpaperIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">Background</Typography>
        </Box>
      </Box>

      {/* Category Filters - Scrollable on small screens */}
      <Box 
        sx={{ 
          display: 'flex', 
          mb: 2, 
          alignItems: 'center',
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
          },
        }}
      >
        {categories.map((category) => (
          <CategoryChip
            key={category}
            label={category.charAt(0).toUpperCase() + category.slice(1)}
            onClick={() => setActiveCategory(category)}
            active={activeCategory === category}
            size="small"
            sx={{ flexShrink: 0, my: 0.5, mr: 0.5 }}
          />
        ))}
      </Box>

      {/* Asset Grid with background mode indicator */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Grid container spacing={1} sx={{ maxHeight: '320px', overflowY: 'auto', mt: 1, pb: 1 }}>
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset, index) => (
              <Grid item xs={6} sm={4} key={`${asset.type}-${index}`}>
                <AssetItemPaper onClick={() => handleAssetSelect(asset)}>
                  <AssetImage src={asset.src} alt={asset.name} />
                  <AssetNameTypography>{asset.name}</AssetNameTypography>
                  
                  {/* Small indicator icon to show if this would be added as background */}
                  {assetMode === 'background' && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 5, 
                        right: 5, 
                        backgroundColor: 'rgba(25, 118, 210, 0.8)',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <WallpaperIcon fontSize="small" sx={{ color: 'white' }} />
                    </Box>
                  )}
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