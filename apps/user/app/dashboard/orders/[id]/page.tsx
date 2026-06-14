interface Props {
  params: {
    id: string;
  };
}

export default function OrderDetailsPage({ params }: Props) {
  return (
    <div className="max-w-5xl mx-auto p-4">
      {" "}
      <h1 className="text-2xl font-bold">Order #{params.id} </h1>
      <p className="mt-2 text-gray-500">Order details page</p>
    </div>
  );
}
