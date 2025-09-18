import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardPreview,
  CardFooter,
  Text, 
  Button,
  makeStyles, 
  tokens,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from '@fluentui/react-components';
import { 
  Heart24Regular, 
  Heart24Filled, 
  Open24Regular,
  Branch24Regular,
  ArrowClockwise24Regular,
  MoreHorizontal24Regular,
  Edit24Regular,
  Delete24Regular,
} from '@fluentui/react-icons';
import { RealPrototype } from '../../types/prototype';
import { useFavorites } from '../../contexts/FavoritesContext';
import { usePrototypes } from '../../hooks/usePrototypes';
import BuildStatusBadge from '../common/BuildStatusBadge';

const useStyles = makeStyles({
  card: {
    height: '100%',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
    '@media (max-width: 768px)': {
      ':hover': {
        transform: 'none', // Disable hover effect on mobile
      },
    },
  },
  preview: {
    height: '160px',
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadiusMedium,
    position: 'relative',
  },
  previewPlaceholder: {
    fontSize: tokens.fontSizeHero700,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
  },
  buildStatus: {
    position: 'absolute',
    top: tokens.spacingVerticalS,
    right: tokens.spacingVerticalS,
  },
  header: {
    paddingBottom: tokens.spacingVerticalXS,
  },
  title: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase300,
    marginBottom: tokens.spacingVerticalXS,
  },
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalXS,
  },
  authorName: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase200,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: tokens.spacingVerticalXS,
  },
  metadata: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flex: 1,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXXS,
  },
  actionButton: {
    minWidth: 'auto',
  },
  gitHubLink: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    textDecoration: 'none',
    ':hover': {
      color: tokens.colorNeutralForeground2,
    },
  },
});

interface RealPrototypeCardProps {
  prototype: RealPrototype;
  showManagement?: boolean;
}

const RealPrototypeCard: React.FC<RealPrototypeCardProps> = ({ 
  prototype, 
  showManagement = false 
}) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { rebuildPrototype, deletePrototype } = usePrototypes();
  const [isRebuildingLoading, setIsRebuildingLoading] = useState(false);
  const styles = useStyles();
  
  const isPrototypeFavorited = isFavorite(prototype.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPrototypeFavorited) {
      removeFavorite(prototype.id);
    } else {
      addFavorite(prototype.id);
    }
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prototype.prototypeUrl && prototype.buildStatus === 'success') {
      window.open(prototype.prototypeUrl, '_blank');
    }
  };

  const handleGitHubClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(prototype.gitHubRepoUrl, '_blank');
  };

  const handleRebuild = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRebuildingLoading(true);
    try {
      await rebuildPrototype(prototype.id);
    } catch (error) {
      console.error('Failed to rebuild prototype:', error);
    } finally {
      setIsRebuildingLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${prototype.name}"?`)) {
      try {
        await deletePrototype(prototype.id);
      } catch (error) {
        console.error('Failed to delete prototype:', error);
      }
    }
  };

  const handleCardClick = () => {
    if (prototype.prototypeUrl && prototype.buildStatus === 'success') {
      window.open(prototype.prototypeUrl, '_blank');
    }
  };

  const getAuthorName = () => {
    // Extract username from GitHub owner or use email
    return prototype.gitHubOwner || prototype.createdBy.split('@')[0];
  };

  const canOpen = prototype.prototypeUrl && prototype.buildStatus === 'success';

  return (
    <Card 
      className={styles.card} 
      onClick={canOpen ? handleCardClick : undefined}
      style={{ cursor: canOpen ? 'pointer' : 'default' }}
    >
      <CardPreview className={styles.preview}>
        <div className={styles.previewPlaceholder}>
          {prototype.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.buildStatus}>
          <BuildStatusBadge status={prototype.buildStatus} size="small" />
        </div>
      </CardPreview>
      
      <CardHeader className={styles.header}>
        <Text className={styles.title}>{prototype.name}</Text>
        
        <div className={styles.author}>
          <Avatar 
            name={getAuthorName()}
            size={20}
          />
          <Text className={styles.authorName}>{getAuthorName()}</Text>
        </div>
        
        {prototype.description && (
          <Text className={styles.description}>{prototype.description}</Text>
        )}

        <a
          href={prototype.gitHubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.gitHubLink}
          onClick={(e) => e.stopPropagation()}
        >
          <Branch24Regular />
          <Text>{prototype.gitHubRepoName}</Text>
        </a>
      </CardHeader>

      <CardFooter className={styles.footer}>
        <div className={styles.metadata}>
          <Text>Updated {new Date(prototype.lastUpdated).toLocaleDateString()}</Text>
          {prototype.lastDeployedAt && (
            <>
              <Text>•</Text>
              <Text>Deployed {new Date(prototype.lastDeployedAt).toLocaleDateString()}</Text>
            </>
          )}
        </div>
        
        <div className={styles.actions}>
          <Button
            className={styles.actionButton}
            appearance="subtle"
            size="small"
            icon={isPrototypeFavorited ? <Heart24Filled /> : <Heart24Regular />}
            onClick={handleFavoriteClick}
          />
          
          {canOpen && (
            <Button
              className={styles.actionButton}
              appearance="subtle"
              size="small"
              icon={<Open24Regular />}
              onClick={handleOpenClick}
            />
          )}
          
          {showManagement && (
            <>
              <Button
                className={styles.actionButton}
                appearance="subtle"
                size="small"
                icon={<ArrowClockwise24Regular />}
                onClick={handleRebuild}
                disabled={isRebuildingLoading || prototype.buildStatus === 'building'}
              />
              
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    className={styles.actionButton}
                    appearance="subtle"
                    size="small"
                    icon={<MoreHorizontal24Regular />}
                  />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem icon={<Edit24Regular />}>
                      Edit Details
                    </MenuItem>
                    <MenuItem 
                      icon={<Delete24Regular />}
                      onClick={handleDelete}
                    >
                      Delete Prototype
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default RealPrototypeCard;