import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TabList, Tab, makeStyles, tokens } from '@fluentui/react-components';
import { Heart24Regular, Person24Regular, Grid24Regular } from '@fluentui/react-icons';
import { GallerySection } from '../../types/prototype';

const useStyles = makeStyles({
  tabList: {
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
  },
});

interface SectionTabsProps {
  activeSection: GallerySection['key'];
}

const sections: GallerySection[] = [
  { key: 'favorites', title: 'Favorites', path: '/favorites' },
  { key: 'my-prototypes', title: 'My Prototypes', path: '/my-prototypes' },
  { key: 'all', title: 'All Prototypes', path: '/all' },
];

const getIcon = (key: GallerySection['key']) => {
  switch (key) {
    case 'favorites':
      return <Heart24Regular />;
    case 'my-prototypes':
      return <Person24Regular />;
    case 'all':
      return <Grid24Regular />;
    default:
      return null;
  }
};

const SectionTabs: React.FC<SectionTabsProps> = ({ activeSection }) => {
  const navigate = useNavigate();
  const styles = useStyles();

  const handleTabSelect = (_event: any, data: any) => {
    const section = sections.find(s => s.key === data.value);
    if (section) {
      navigate(section.path);
    }
  };

  return (
    <TabList
      className={styles.tabList}
      selectedValue={activeSection}
      onTabSelect={handleTabSelect}
      size="large"
    >
      {sections.map(section => (
        <Tab
          key={section.key}
          value={section.key}
          icon={getIcon(section.key)}
        >
          {section.title}
        </Tab>
      ))}
    </TabList>
  );
};

export default SectionTabs;