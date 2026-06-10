type AudioPlayerProps = {
  src: string;
  title: string;
};

export function AudioPlayer({ src, title }: AudioPlayerProps) {
  return (
    <div className="audio-player">
      <span>{title}</span>
      {/* biome-ignore lint/a11y/useMediaCaption: Music preview captions are not available yet. */}
      <audio controls preload="none">
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
