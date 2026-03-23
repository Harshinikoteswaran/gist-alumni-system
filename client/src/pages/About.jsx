import React from "react";

export default function About() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          About the Department of Computer Science & Engineering
        </h3>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
          The Department of Computer Science and Engineering was established in 2008. The undergraduate
          Bachelor of Technology (B.Tech.) program began with an intake of 60 students and has grown to an
          intake of 420 students by 2024. The department also offers a postgraduate Master of Technology (M.Tech.)
          program with an intake of 18 students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Mission & Objectives</h4>
          <p className="text-gray-600 mb-4">
            The department's primary objective is to provide a forum for learning about advanced and
            emerging technologies while fostering strong collaboration between industry and academia.
            It promotes industry-institute interaction, supports research projects, and prepares students
            for diverse careers in information technology.
          </p>

          <h4 className="text-lg font-semibold text-gray-800 mb-2">Research Areas</h4>
          <p className="text-gray-600 mb-4">
            Major research areas include Artificial Intelligence, Machine Learning, Data Science, Cloud
            Computing, Internet of Things (IoT), Cyber Security, Deep Learning, Image Processing, Information
            Security, and Networks.
          </p>

          <h4 className="text-lg font-semibold text-gray-800 mb-2">Labs & Facilities</h4>
          <p className="text-gray-600 mb-4">
            The department maintains dedicated laboratories equipped with up-to-date hardware and software.
            Experienced technical and support staff complement the labs to provide hands-on learning and project work.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Student Chapters & Activities</h4>
          <p className="text-gray-600 mb-4">
            The department holds institutional memberships such as CSI, ACM, and ISTE, and hosts active student chapters.
            These chapters organize technical workshops, seminars, coding contests, hackathons, and project development activities.
          </p>

          <h4 className="text-lg font-semibold text-gray-800 mb-2">Training & Industry Programs</h4>
          <p className="text-gray-600 mb-4">
            The department runs training programs and certification courses in partnership with ICT, CISCO, and Oracle Academy
            to boost students' employability and practical skills.
          </p>

          <h4 className="text-lg font-semibold text-gray-800 mb-2">Achievements & Student Life</h4>
          <p className="text-gray-600 mb-4">
            Students regularly participate in national and international events, earning accolades across technical and
            non-technical arenas. Sports and extracurricular activities are encouraged to foster well-rounded development.
          </p>
        </div>
      </div>


    </section>
  );
}
