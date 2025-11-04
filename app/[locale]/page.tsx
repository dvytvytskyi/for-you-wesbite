import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Areas from '@/components/Areas';
import Statistics from '@/components/Statistics';
import AboutUs from '@/components/AboutUs';
import Partners from '@/components/Partners';
import ProjectImage from '@/components/ProjectImage';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Statistics />
      <AboutUs />
      <Partners />
      <Areas />
      <ProjectImage />
      <Footer />
    </>
  );
}
