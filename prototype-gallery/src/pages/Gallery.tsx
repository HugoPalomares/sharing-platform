import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { makeStyles, tokens } from '@fluentui/react-components';
import Header from '../components/common/Header';
import Favorites from './Favorites';
import MyPrototypes from './MyPrototypes';
import AllPrototypes from './AllPrototypes';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    flex: 1,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  }
});

const Gallery: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <Routes>
          <Route index element={<Navigate to="/all" replace />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="my-prototypes" element={<MyPrototypes />} />
          <Route path="all" element={<AllPrototypes />} />
        </Routes>
      </div>
    </div>
  );
};

export default Gallery;