import Image from "next/image";

interface PreviewProps {
  content: string;
  image?: string;
}

const Preview: React.FC<PreviewProps> = ({ content, image }) => {
  return (
    <div className="paragraph-regular text-dark300_light700 mt-3.5 break-words">
      {content}
      {image && (
        <div className="relative h-60 w-full sm:w-96 mt-4 overflow-hidden rounded-md border border-gray-300 shadow-light100_dark100">
          <Image
            src={image}
            alt="Preview attachment"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default Preview;
