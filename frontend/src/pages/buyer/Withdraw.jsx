import { useNavigate } from 'react-router-dom';

export default function Withdraw() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Withdraw</h1>
        <p className="text-gray-600">This feature will be available soon.</p>
        <div className="mt-6">
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-blue-600 text-white">Go back</button>
        </div>
      </div>
    </div>
  );
}
