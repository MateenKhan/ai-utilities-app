import React, { Suspense } from 'react';
import Loading from '../Loading';

interface LazyLoadedProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

const LazyLoaded: React.FC<LazyLoadedProps> = ({ component: Component, ...props }) => {
  return (
    <Suspense fallback={<Loading />}>
      <Component {...props} />
    </Suspense>
  );
};

export default LazyLoaded;
