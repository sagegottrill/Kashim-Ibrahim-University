import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { generateSlip } from '../utils/generateSlip';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGeneratingSlip, setIsGeneratingSlip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplication = async () => {
      if (user?.email) {
        // Fetch application using RPC (works for Firebase Auth users who are 'anon' to Supabase)
        // console.log('Fetching application for email:', user.email);
        const { data: appData, error } = await supabase
          .rpc('get_application_by_email', { email_input: user.email })
          .maybeSingle();

        if (error) {
          console.error('Error fetching application:', error);
        }

        if (appData) {
          // console.log('Application found:', appData);
          setApplication(appData);
        } else {
          // console.log('No application found');
        }

        // Fetch user profile name
        const { data: userData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.uid)
          .single();

        if (userData?.full_name) {
          setUserName(userData.full_name);
        }
      }
      setLoading(false);
    };

    fetchApplication();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') navigate('/');
    else if (page === 'auth') navigate('/auth');
    else if (page === 'admin') navigate('/admin');
    else navigate(`/?view=${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header currentPage="dashboard" onNavigate={handleNavigate} />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">My Dashboard</h1>
              <p className="text-gray-600">Welcome, {userName || user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
          </div>

          {application ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#4a9d7e]">Application Status: Submitted</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Reference Number</p>
                    <p className="font-medium text-lg">{application.reference_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium text-lg">{application.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-lg">{application.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date Applied</p>
                    <p className="font-medium text-lg">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={async () => {
                      setIsGeneratingSlip(true);
                      try {
                        await generateSlip({
                          ...application,
                          passport_url: application.photo_url
                        });
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setIsGeneratingSlip(false);
                      }
                    }}
                    disabled={isGeneratingSlip}
                    className="bg-[#1e3a5f] hover:bg-[#162c4b] w-full sm:w-auto"
                  >
                    {isGeneratingSlip ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Slip...
                      </>
                    ) : (
                      'Download Application Slip'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">No Application Found</h3>
                <p className="text-gray-600 mb-6">You haven't submitted an application yet.</p>
                <Button
                  onClick={() => navigate('/?view=jobs')}
                  className="bg-[#4a9d7e] hover:bg-[#3d8568] text-lg px-8 py-6"
                >
                  Start New Application
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
