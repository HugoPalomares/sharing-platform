import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardPreview,
  CardFooter,
  Text, 
  Button,
  makeStyles, 
  tokens,
  Avatar
} from '@fluentui/react-components';
import { Heart24Regular, Heart24Filled, Open24Regular } from '@fluentui/react-icons';
import { Prototype } from '../../types/prototype';
import { useFavorites } from '../../contexts/FavoritesContext';

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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadiusMedium,
  },
  previewPlaceholder: {
    fontSize: tokens.fontSizeBase600,
    color: tokens.colorNeutralForeground3,
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
    gap: tokens.spacingHorizontalXS,
  },
  favoriteButton: {
    minWidth: 'auto',
  },
});

interface PrototypeCardProps {
  prototype: Prototype;
}

const PrototypeCard: React.FC<PrototypeCardProps> = ({ prototype }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
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
    window.open(prototype.url, '_blank');
  };

  const handleCardClick = () => {
    window.open(prototype.url, '_blank');
  };

  return (
    <Card className={styles.card} onClick={handleCardClick}>
      <CardPreview className={styles.preview}>
        <div className={styles.previewPlaceholder}>
          {prototype.title.charAt(0).toUpperCase()}
        </div>
      </CardPreview>
      
      <CardHeader className={styles.header}>
        <Text className={styles.title}>{prototype.title}</Text>
        
        <div className={styles.author}>
          <Avatar 
            name={prototype.author.name}
            size={20}
          />
          <Text className={styles.authorName}>{prototype.author.name}</Text>
        </div>
        
        <Text className={styles.description}>{prototype.description}</Text>
      </CardHeader>

      <CardFooter className={styles.footer}>
        <div className={styles.metadata}>
          <Text>{prototype.productArea}</Text>
          <Text>•</Text>
          <Text>{new Date(prototype.lastUpdated).toLocaleDateString()}</Text>
        </div>
        
        <div className={styles.actions}>
          <Button
            className={styles.favoriteButton}
            appearance="subtle"
            size="small"
            icon={isPrototypeFavorited ? <Heart24Filled /> : <Heart24Regular />}
            onClick={handleFavoriteClick}
          />
          <Button
            appearance="subtle"
            size="small"
            icon={<Open24Regular />}
            onClick={handleOpenClick}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default PrototypeCard;