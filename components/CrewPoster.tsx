import React from 'react';
import Image from 'next/image';
import { CrewMember } from '@/types/types';

interface MergedCrewMember extends CrewMember {
  roles: string[];
}

interface CrewPosterProps {
  crewMember: MergedCrewMember;
}

const CrewPoster: React.FC<CrewPosterProps> = ({ crewMember }) => {
  const { name, profile_path, roles } = crewMember;

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md bg-card transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
      <div className="relative aspect-[2/3]">
        {profile_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${profile_path}`}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-foreground text-lg">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-1 truncate">{name}</h2>
        {roles.map((role, index) => (
          <p key={index} className="text-sm text-muted-foreground truncate">{role}</p>
        ))}
      </div>
    </div>
  );
};

export default CrewPoster;