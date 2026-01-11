
import LazyLoaded from '@/components/utilities/LazyLoaded';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

const ImageTilesContent = dynamic(() => import('@/components/utilities/ImageTiles/ImageTilesContent'), {
    loading: () => <Loading />,
    ssr: false,
});

export default function ImageTilesPage() {
    return (
        <LazyLoaded>
            <ImageTilesContent />
        </LazyLoaded>
    );
}

