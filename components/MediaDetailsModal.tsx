import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/Spinner';

interface MediaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'movie' | 'tv' | 'person';
  mediaId: number;
}

const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({ isOpen, onClose, mediaType, mediaId }) => {
  const [details, setDetails] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && mediaId) {
      setIsLoading(true);
      setError(null);
      fetch(`/api/media-details?mediaType=${mediaType}&id=${mediaId}`)
        .then((res) => res.json())
        .then((data) => {
          setDetails(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching media details:', err);
          setError('Failed to load details. Please try again.');
          setIsLoading(false);
        });
    }
  }, [isOpen, mediaType, mediaId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return <p className="text-destructive text-center">{error}</p>;
    }

    if (!details) {
      return null;
    }

    switch (mediaType) {
      case 'movie':
      case 'tv':
        return (
          <>
            <div className="flex flex-col md:flex-row gap-6">
              <Image
                src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                alt={details.title || details.name}
                width={300}
                height={450}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{details.title || details.name}</h2>
                <p className="text-muted-foreground mb-4">{details.tagline}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {details.genres?.map((genre: { id: number; name: string }) => (
                    <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
                  ))}
                </div>
                <p className="mb-4">{details.overview}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Release Date</h3>
                    <p>{details.release_date || details.first_air_date}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Runtime</h3>
                    <p>{details.runtime || details.episode_run_time?.[0]} minutes</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Status</h3>
                    <p>{details.status}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Original Language</h3>
                    <p>{details.original_language}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'person':
        return (
          <>
            <div className="flex flex-col md:flex-row gap-6">
              <Image
                src={`https://image.tmdb.org/t/p/w500${details.profile_path}`}
                alt={details.name}
                width={300}
                height={450}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{details.name}</h2>
                <p className="mb-4">{details.biography}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Birthday</h3>
                    <p>{details.birthday}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Place of Birth</h3>
                    <p>{details.place_of_birth}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Known For</h3>
                    <p>{details.known_for_department}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Popularity</h3>
                    <p>{details.popularity?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{details?.title || details?.name || 'Media Details'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MediaDetailsModal;